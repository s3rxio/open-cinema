"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { Loader } from "@open-cinema/ui";
import {
  DASHBOARD_USERS_QUERY,
  DASHBOARD_USER_QUERY,
  REMOVE_USER_MUTATION,
  UPDATE_USER_MUTATION
} from "@/shared/api/operations/dashboard";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { useAuth } from "@/shared/auth/AuthContext";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { UserEditForm, type UserFormValues } from "./UserEditForm";

type UserEditPageProps = {
  id: string;
};

export function UserEditPage({ id }: UserEditPageProps) {
  const { user: currentUser } = useAuth();
  const isSelf = currentUser?.id === id;
  const userQuery = useQuery(DASHBOARD_USER_QUERY, { variables: { id } });
  const [updateUser, updateUserState] = useMutation(UPDATE_USER_MUTATION);
  const [removeUser] = useMutation(REMOVE_USER_MUTATION);
  const [status, setStatus] = useState<string | null>(null);

  const user = userQuery.data?.user;

  if (userQuery.loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-destructive">
        {userQuery.error
          ? getApolloErrorMessage(userQuery.error)
          : "Пользователь не найден"}
      </p>
    );
  }

  const initial: UserFormValues = {
    username: user.username,
    email: user.email,
    password: "",
    birthdate: user.birthdate ? user.birthdate.slice(0, 10) : "",
    roleSlug: (user.roles?.[0]?.slug ?? "user") as UserFormValues["roleSlug"]
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/users"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Назад к списку
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">
            {user.username}
          </h2>
        </div>
        <AdminDeleteButton
          label="Удалить пользователя"
          confirmMessage={`Удалить пользователя «${user.username}»?`}
          redirectTo="/dashboard/users"
          refetchQueries={[DASHBOARD_USERS_QUERY]}
          onDelete={() => removeUser({ variables: { id } })}
        />
      </div>

      <div className="max-w-2xl space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <UserEditForm
          key={user.id}
          initial={initial}
          saving={updateUserState.loading}
          roleDisabled={isSelf}
          onSubmit={async values => {
            setStatus(null);
            try {
              await updateUser({
                variables: {
                  updateUserInput: {
                    id,
                    username: values.username,
                    email: values.email,
                    ...(values.password ? { password: values.password } : {}),
                    birthdate: values.birthdate
                      ? new Date(values.birthdate).toISOString()
                      : null,
                    ...(!isSelf ? { roleSlug: values.roleSlug } : {})
                  }
                },
                refetchQueries: [
                  { query: DASHBOARD_USER_QUERY, variables: { id } }
                ]
              });
              setStatus("Сохранено");
            } catch (error) {
              setStatus(getApolloErrorMessage(error));
            }
          }}
        />

        {status ? (
          <p className="text-sm text-muted-foreground">{status}</p>
        ) : null}
      </div>
    </div>
  );
}
