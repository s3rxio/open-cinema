"use client";

import { print, type DocumentNode } from "graphql";
import { APOLLO_PREFLIGHT_HEADERS } from "./apolloHeaders";

type UploadFileMap = Record<string, File>;

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
}): Promise<TResult> {
  return graphqlUploadRequest({
    document: options.document,
    variables: options.variables,
    files: { [options.fileVariablePath]: options.file }
  });
}

export async function graphqlUploadRequest<TResult>(options: {
  document: DocumentNode;
  variables: Record<string, unknown>;
  files: UploadFileMap;
}): Promise<TResult> {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3333/graphql";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const query = print(options.document);
  const formData = buildFormData(query, options.variables, options.files);

  const response = await fetch(uri, {
    method: "POST",
    headers: {
      ...APOLLO_PREFLIGHT_HEADERS,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: formData,
    credentials: "include"
  });

  const json = (await response.json()) as {
    data?: TResult;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map(error => error.message).join(", "));
  }

  if (!json.data) {
    throw new Error("Пустой ответ сервера");
  }

  return json.data;
}
