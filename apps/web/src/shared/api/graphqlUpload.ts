"use client";

import { print, type DocumentNode } from "graphql";
import { getAccessToken } from "@/shared/auth/authTokens";
import { isAuthError } from "@/shared/auth/isAuthError";
import { refreshAccessToken } from "@/shared/auth/refreshAccessToken";
import { sessionLogout } from "@/shared/auth/sessionLogout";
import { APOLLO_PREFLIGHT_HEADERS } from "./apolloHeaders";

type UploadFileMap = Record<string, File>;

export type UploadProgress = {
  loaded: number;
  total: number | null;
  percent: number | null;
};

export type UploadProgressHandler = (progress: UploadProgress) => void;

function buildFormData(
  query: string,
  variables: Record<string, unknown>,
  files: UploadFileMap
): FormData {
  const filePaths = Object.keys(files);
  const map: Record<string, string[]> = {};
  const operationsVariables = structuredClone(variables);

  filePaths.forEach((path, index) => {
    map[String(index)] = [`variables.${path}`];
    setNestedValue(operationsVariables, path, null);
  });

  const formData = new FormData();
  formData.append(
    "operations",
    JSON.stringify({ query, variables: operationsVariables })
  );
  formData.append("map", JSON.stringify(map));

  filePaths.forEach((path, index) => {
    formData.append(String(index), files[path]);
  });

  return formData;
}

function setNestedValue(
  target: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const parts = path.split(".");
  let current: Record<string, unknown> = target;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

export async function graphqlSingleFileUpload<TResult>(options: {
  document: DocumentNode;
  variables: Record<string, unknown>;
  fileVariablePath: string;
  file: File;
  onUploadProgress?: UploadProgressHandler;
}): Promise<TResult> {
  return graphqlUploadRequest({
    document: options.document,
    variables: options.variables,
    files: { [options.fileVariablePath]: options.file },
    onUploadProgress: options.onUploadProgress
  });
}

type GraphqlUploadResponse<TResult> = {
  data?: TResult;
  errors?: Array<{ message: string }>;
};

function parseUploadResponse<TResult>(
  status: number,
  json: GraphqlUploadResponse<TResult>
): TResult {
  if (status === 401) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  if (json.errors?.length) {
    const message = json.errors.map(error => error.message).join(", ");
    if (/unauthorized/i.test(message)) {
      throw Object.assign(new Error(message), { statusCode: 401 });
    }
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error("Пустой ответ сервера");
  }

  return json.data;
}

async function executeUploadRequest<TResult>(options: {
  uri: string;
  formData: FormData;
}): Promise<TResult> {
  const token = getAccessToken();

  const response = await fetch(options.uri, {
    method: "POST",
    headers: {
      ...APOLLO_PREFLIGHT_HEADERS,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: options.formData,
    credentials: "include"
  });

  const json = (await response.json()) as GraphqlUploadResponse<TResult>;
  return parseUploadResponse(response.status, json);
}

function executeUploadRequestWithProgress<TResult>(options: {
  uri: string;
  formData: FormData;
  onUploadProgress?: UploadProgressHandler;
}): Promise<TResult> {
  const token = getAccessToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", options.uri);
    xhr.withCredentials = true;

    for (const [key, value] of Object.entries(APOLLO_PREFLIGHT_HEADERS)) {
      xhr.setRequestHeader(key, value);
    }
    if (token) {
      xhr.setRequestHeader("authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", event => {
      if (!options.onUploadProgress) return;
      options.onUploadProgress({
        loaded: event.loaded,
        total: event.lengthComputable ? event.total : null,
        percent: event.lengthComputable
          ? Math.min(100, Math.round((event.loaded / event.total) * 100))
          : null
      });
    });

    xhr.addEventListener("load", () => {
      try {
        const json = JSON.parse(
          xhr.responseText
        ) as GraphqlUploadResponse<TResult>;
        resolve(parseUploadResponse(xhr.status, json));
      } catch {
        reject(new Error("Не удалось разобрать ответ сервера"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Ошибка сети при загрузке"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Загрузка отменена"));
    });

    xhr.send(options.formData);
  });
}

async function runUploadRequest<TResult>(options: {
  uri: string;
  formData: FormData;
  onUploadProgress?: UploadProgressHandler;
}): Promise<TResult> {
  if (options.onUploadProgress) {
    return executeUploadRequestWithProgress<TResult>(options);
  }
  return executeUploadRequest<TResult>(options);
}

export async function graphqlUploadRequest<TResult>(options: {
  document: DocumentNode;
  variables: Record<string, unknown>;
  files: UploadFileMap;
  onUploadProgress?: UploadProgressHandler;
}): Promise<TResult> {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";

  const query = print(options.document);
  const formData = buildFormData(query, options.variables, options.files);

  try {
    return await runUploadRequest<TResult>({
      uri,
      formData,
      onUploadProgress: options.onUploadProgress
    });
  } catch (error) {
    if (!isAuthError(error)) {
      throw error;
    }

    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      sessionLogout();
      throw error;
    }

    return runUploadRequest<TResult>({
      uri,
      formData,
      onUploadProgress: options.onUploadProgress
    });
  }
}
