import { forwardRef } from "react"
import { chakra, type HTMLChakraProps } from "@chakra-ui/react"

export interface SelectOption {
    value: string
    label: string
}

export interface CustomSelectProps extends Omit<HTMLChakraProps<"select">, "children"> {
    options: SelectOption[]
    placeholder?: string
}

const ChakraSelect = chakra("select")

export const Select = forwardRef<HTMLSelectElement, CustomSelectProps>(
    ({ options, placeholder = "Select an option...", ...props }, ref) => {
        return (
            <ChakraSelect
                ref={ref}
                bg="bg"
                borderColor="border"
                borderRadius="md"
                borderWidth="1px"
                px="3"
                py="2"
                fontSize="sm"
                minH="10"
                _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500",
                }}
                _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                }}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option: SelectOption) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </ChakraSelect>
        )
    }
)

Select.displayName = "Select"