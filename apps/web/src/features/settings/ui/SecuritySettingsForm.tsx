"use client";

import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Input, Label } from "@open-cinema/ui";
import { CHANGE_PASSWORD_MUTATION } from "@/shared/api/operations/settings";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  changePasswordSchema,
  type ChangePasswordFormValues
} from "../lib/schemas";

export function SecuritySettingsForm() {
  const [changePassword, changePasswordState] = useMutation(
    CHANGE_PASSWORD_MUTATION
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currPass: "",
      newPass: "",
      confirmNewPass: ""
    }
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword({
        variables: {
          changePasswordInput: {
            currPass: values.currPass,
            newPass: values.newPass,
            confirmNewPass: values.confirmNewPass
          }
        }
      });
      reset();
    } catch {
      // error shown below
    }
  };

  const statusMessage = changePasswordState.error
    ? getApolloErrorMessage(changePasswordState.error)
    : changePasswordState.data
      ? "Пароль изменён"
      : null;

  const loading = isSubmitting || changePasswordState.loading;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="currPass">Текущий пароль</Label>
        <Input
          id="currPass"
          type="password"
          autoComplete="current-password"
          {...register("currPass")}
          aria-invalid={errors.currPass ? true : undefined}
        />
        {errors.currPass ? (
          <p className="text-sm text-destructive">{errors.currPass.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPass">Новый пароль</Label>
        <Input
          id="newPass"
          type="password"
          autoComplete="new-password"
          {...register("newPass")}
          aria-invalid={errors.newPass ? true : undefined}
        />
        {errors.newPass ? (
          <p className="text-sm text-destructive">{errors.newPass.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPass">Подтверждение нового пароля</Label>
        <Input
          id="confirmNewPass"
          type="password"
          autoComplete="new-password"
          {...register("confirmNewPass")}
          aria-invalid={errors.confirmNewPass ? true : undefined}
        />
        {errors.confirmNewPass ? (
          <p className="text-sm text-destructive">
            {errors.confirmNewPass.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Сохранение…" : "Изменить пароль"}
      </Button>

      {statusMessage ? (
        <p
          className={
            changePasswordState.data
              ? "text-sm text-muted-foreground"
              : "text-sm text-destructive"
          }
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
