"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@open-cinema/ui";
import {
  ROLE_OPTIONS,
  type RoleSlugValue
} from "@/features/dashboard/lib/roleOptions";

export type UserFormValues = {
  username: string;
  email: string;
  password: string;
  birthdate: string;
  roleSlug: RoleSlugValue;
};

type UserEditFormProps = {
  initial: UserFormValues;
  saving?: boolean;
  passwordRequired?: boolean;
  submitLabel?: string;
  roleDisabled?: boolean;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

export function UserEditForm({
  initial,
  saving,
  passwordRequired = false,
  submitLabel = "Сохранить",
  roleDisabled = false,
  onSubmit
}: UserEditFormProps) {
  const [values, setValues] = useState(initial);

  const update = <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K]
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async event => {
        event.preventDefault();
        await onSubmit(values);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          value={values.username}
          onChange={event => update("username", event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={event => update("email", event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Роль</Label>
        <Select
          value={values.roleSlug}
          onValueChange={value => update("roleSlug", value as RoleSlugValue)}
          disabled={roleDisabled}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roleDisabled ? (
          <p className="text-sm text-muted-foreground">
            Нельзя изменить собственную роль
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {passwordRequired ? "Пароль" : "Новый пароль"}
        </Label>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={event => update("password", event.target.value)}
          placeholder={
            passwordRequired ? undefined : "Оставьте пустым, чтобы не менять"
          }
          required={passwordRequired}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Дата рождения</Label>
        <Input
          id="birthdate"
          type="date"
          value={values.birthdate}
          onChange={event => update("birthdate", event.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Сохранение…" : submitLabel}
      </Button>
    </form>
  );
}
