import { ObjectSchema } from 'joi'

export type ValidateRequestResult = {
    ok: boolean
    error: string
    value: any
}

export const validateRequest = (body: any, schema: ObjectSchema): ValidateRequestResult => {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    }

    const { error, value } = schema.validate(body, options)

    if (error) {
        return {
            ok: false,
            error: `Validation error: ${error.details.map((x) => x.message).join(', ')}`,
            value: null,
        }
    }

    return {
        ok: true,
        error: '',
        value,
    }
}
