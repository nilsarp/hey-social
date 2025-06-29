import cn from "@/helpers/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn
} from "react-hook-form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { TypeOf, ZodSchema } from "zod";
import { H6 } from "./Typography";

interface UseZodFormProps<T extends ZodSchema<FieldValues>>
  extends UseFormProps<TypeOf<T>> {
  schema: T;
}

export const useZodForm = <T extends ZodSchema<any>>({
  schema,
  ...formConfig
}: UseZodFormProps<T>) => {
  return useForm({
    ...formConfig,
    resolver: zodResolver(schema as any)
  });
};

interface FieldErrorProps {
  name?: string;
}

export const FieldError = ({ name }: FieldErrorProps) => {
  const {
    formState: { errors }
  } = useFormContext();

  if (!name) {
    return null;
  }

  const error = errors[name];

  if (!error) {
    return null;
  }

  return <H6 className="mt-2 text-red-500">{error.message as string}</H6>;
};

interface FormProps<T extends FieldValues = Record<string, unknown>>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  className?: string;
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
}

export const Form = <T extends FieldValues>({
  children,
  className = "",
  form,
  onSubmit
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className={cn("flex flex-col", className)}
          disabled={form.formState.isSubmitting}
        >
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
};
