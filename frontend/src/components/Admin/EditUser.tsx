import {
  Button,
  DialogActionTrigger,
  DialogRoot,
  DialogTrigger,
  Flex,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import { type UserPublic, UsersService, type UserUpdate } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { useTeams } from "@/hooks/useTeams"
import { emailPattern, handleError } from "@/utils"
import { Checkbox } from "../ui/checkbox"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

interface EditUserProps {
  user: UserPublic
}

interface UserUpdateForm extends UserUpdate {
  confirm_password?: string
}

const EditUser = ({ user }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingRecord, setIsLoadingRecord] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...user,
      team_id: user.team_id || "",
    },
  })

  // Fetch fresh record when dialog opens
  const fetchRecord = async () => {
    setIsLoadingRecord(true)
    try {
      const freshRecord = await UsersService.readUserById({ userId: user.id })
      reset({
        email: freshRecord.email,
        full_name: freshRecord.full_name,
        team_id: freshRecord.team_id || "",
        is_superuser: freshRecord.is_superuser,
        is_active: freshRecord.is_active,
      })
    } catch (error) {
      console.error("Failed to fetch record:", error)
    } finally {
      setIsLoadingRecord(false)
    }
  }

  // Watch the password field and auto-fill confirm_password
  const watchedPassword = watch("password")
  React.useEffect(() => {
    if (watchedPassword) {
      setValue("confirm_password", watchedPassword)
    }
  }, [watchedPassword, setValue])

  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit: SubmitHandler<UserUpdateForm> = async (data) => {
    if (data.password === "") {
      data.password = undefined
    }
    mutation.mutate(data)
  }

  const handleOpenChange = async ({ open }: { open: boolean }) => {
    if (open) {
      setIsOpen(true)
      await fetchRecord()
    } else {
      setIsOpen(false)
    }
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FaExchangeAlt fontSize="16px" />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent>
        {isLoadingRecord ? (
          <DialogBody>Loading...</DialogBody>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text mb={4}>Update the user details below.</Text>
              <VStack gap={4}>
                <Field
                  required
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                  label="Email"
                >
                  <Input
                    {...register("email", {
                      required: "Email is required",
                      pattern: emailPattern,
                    })}
                    placeholder="Email"
                    type="email"
                  />
                </Field>

                <Field
                  invalid={!!errors.full_name}
                  errorText={errors.full_name?.message}
                  label="Full Name"
                >
                  <Input
                    {...register("full_name")}
                    placeholder="Full name"
                    type="text"
                  />
                </Field>

                <Field
                  invalid={!!errors.team_id}
                  errorText={errors.team_id?.message}
                  label="Team"
                >
                  <Controller
                    control={control}
                    name="team_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ""}
                        placeholder="Select team..."
                        options={teams.map(team => ({
                          value: team.id,
                          label: team.name
                        }))}
                        disabled={isLoadingTeams || isSubmitting}
                      />
                    )}
                  />
                </Field>

                <Field
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                  label="Set Password"
                >
                  <Input
                    {...register("password", {
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    placeholder="Password"
                    type="password"
                  />
                </Field>

                <Field
                  invalid={!!errors.confirm_password}
                  errorText={errors.confirm_password?.message}
                  label="Confirm Password"
                >
                  <Input
                    {...register("confirm_password", {
                      validate: (value) =>
                        value === getValues().password ||
                        "The passwords do not match",
                    })}
                    placeholder="Password"
                    type="password"
                  />
                </Field>
              </VStack>

              <Flex mt={4} direction="column" gap={4}>
                <Controller
                  control={control}
                  name="is_superuser"
                  render={({ field }) => (
                    <Field disabled={field.disabled} colorPalette="teal">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={({ checked }) => field.onChange(checked)}
                      >
                        Is superuser?
                      </Checkbox>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <Field disabled={field.disabled} colorPalette="teal">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={({ checked }) => field.onChange(checked)}
                      >
                        Is active?
                      </Checkbox>
                    </Field>
                  )}
                />
              </Flex>
            </DialogBody>

            <DialogFooter gap={2}>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </form>
        )}
      </DialogContent>
    </DialogRoot>
  )
}

export default EditUser
