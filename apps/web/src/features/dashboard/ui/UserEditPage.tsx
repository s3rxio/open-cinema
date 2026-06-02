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
import { Container } from "@/shared/ui/Container";

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
      <section>
        <Container size="dashboard">
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        </Container>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <Container size="dashboard">
          <p className="text-destructive">
            {userQuery.error
              ? getApolloErrorMessage(userQuery.error)
              : "Пользователь не найден"}
          </p>
        </Container>
      </section>
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
    <>
      <section>
        <Container size="dashboard">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard/users"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Назад к списку
              </Link>
              <h1 className="text-2xl font-semibold">{user.username}</h1>
            </div>
            <AdminDeleteButton
              label="Удалить пользователя"
              confirmMessage={`Удалить пользователя «${user.username}»?`}
              redirectTo="/dashboard/users"
              refetchQueries={[DASHBOARD_USERS_QUERY]}
              onDelete={() => removeUser({ variables: { id } })}
            />
          </div>
        </Container>
      </section>

      <section>
        <Container size="dashboard">
          <div className="space-y-6">
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
                    refetchQueries: [{ query: DASHBOARD_USER_QUERY, variables: { id } }]
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
        </Container>
      </section>
    </>
  );
}
