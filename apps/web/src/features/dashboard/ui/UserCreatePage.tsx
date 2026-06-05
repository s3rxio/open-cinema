"use client";

import { useMutation, useApolloClient } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toGraphQLDateTimeOrNull } from "@open-cinema/ui";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  CREATE_USER_MUTATION,
  DASHBOARD_USERS_QUERY
} from "@/features/dashboard/api/dashboard";
import { UserEditForm, type UserFormValues } from "./UserEditForm";

const emptyUserForm: UserFormValues = {
  username: "",
  email: "",
  password: "",
  birthdate: "",
  roleSlug: "user"
};

export function UserCreatePage() {
  const router = useRouter();
  const client = useApolloClient();
  const [createUser, createUserState] = useMutation(CREATE_USER_MUTATION);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard/users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад к списку
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">
          Создать пользователя
        </h2>
      </div>

      <div className="max-w-2xl space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <UserEditForm
          initial={emptyUserForm}
          saving={createUserState.loading}
          passwordRequired
          submitLabel="Создать"
          onSubmit={async values => {
            setStatus(null);
            try {
              const result = await createUser({
                variables: {
                  createUserInput: {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    roleSlug: values.roleSlug,
                    birthdate: toGraphQLDateTimeOrNull(values.birthdate)
                  }
                }
              });

              const id = result.data?.createUser.id;
              if (!id) {
                throw new Error("Не удалось создать пользователя");
              }

              await client.refetchQueries({ include: [DASHBOARD_USERS_QUERY] });
              router.push(`/dashboard/users/${id}`);
              router.refresh();
            } catch (error) {
              setStatus(getApolloErrorMessage(error));
            }
          }}
        />

        {status ? <p className="text-sm text-destructive">{status}</p> : null}
      </div>
    </div>
  );
}
