"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Label, Loader } from "@open-cinema/ui";
import {
  SETTINGS_ME_QUERY,
  UPDATE_PROFILE_MUTATION
} from "@/entities/user";
import { ME_QUERY } from "@/entities/favorite";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { useAuthStore } from "@/shared/state";
import { profileSchema, type ProfileFormValues } from "../lib/schemas";

export function ProfileSettingsForm() {
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const meQuery = useQuery(SETTINGS_ME_QUERY);
  const [updateProfile, updateProfileState] = useMutation(
    UPDATE_PROFILE_MUTATION
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      birthdate: ""
    }
  });

  useEffect(() => {
    const me = meQuery.data?.me;
    if (!me) {
      return;
    }

    reset({
      username: me.username,
      email: me.email,
      birthdate: me.birthdate ? me.birthdate.slice(0, 10) : ""
    });
  }, [meQuery.data, reset]);

  if (meQuery.loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!meQuery.data?.me) {
    return (
      <p className="text-destructive text-sm">
        {meQuery.error
          ? getApolloErrorMessage(meQuery.error)
          : "Не удалось загрузить профиль"}
      </p>
    );
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const result = await updateProfile({
        variables: {
          updateProfileInput: {
            username: values.username,
            email: values.email,
            birthdate: values.birthdate
              ? new Date(values.birthdate).toISOString()
              : null
          }
        },
        refetchQueries: [{ query: SETTINGS_ME_QUERY }, { query: ME_QUERY }]
      });

      const updated = result.data?.updateProfile;
      if (updated && user) {
        setUser({
          ...user,
          username: updated.username,
          email: updated.email
        });
      }
    } catch {
      // errors shown via updateProfileState
    }
  };

  const serverError = updateProfileState.error
    ? getApolloErrorMessage(updateProfileState.error)
    : updateProfileState.data
      ? "Сохранено"
      : null;

  const loading = isSubmitting || updateProfileState.loading;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          {...register("username")}
          aria-invalid={errors.username ? true : undefined}
        />
        {errors.username ? (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Дата рождения</Label>
        <Input id="birthdate" type="date" {...register("birthdate")} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Сохранение…" : "Сохранить"}
      </Button>

      {serverError ? (
        <p
          className={
            updateProfileState.data
              ? "text-sm text-muted-foreground"
              : "text-sm text-destructive"
          }
        >
          {serverError}
        </p>
      ) : null}
    </form>
  );
}
