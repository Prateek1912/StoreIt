"use client";

import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/users.actions";
import OTPModal from "./OTPModal";

type FormType = "SignIn" | "SignUp";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "SignUp" ? z.string().min(2).max(50) : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const user =
        type === "SignUp"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      if (!user.accountId) setErrorMessage("User not found !!! Please sign up");

      setAccountId(user.accountId);
    } catch (error) {
      setErrorMessage(
        error?.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "SignIn" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "SignUp" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className="shad-input"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="shad-input"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="form-submit-button"
            disabled={loading}
          >
            {type === "SignIn" ? "Sign In" : "Sign Up"}
            {loading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loading"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "SignIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              className="ml-1 font-medium text-brand"
              href={type === "SignIn" ? "/sign-up" : "/sign-in"}
            >
              {" "}
              {type === "SignIn" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>
      {accountId && (
        <OTPModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
};

export default AuthForm;
