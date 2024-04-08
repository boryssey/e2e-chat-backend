import S from 'fluent-json-schema'

export const RegisterRequestDTO = S.object()
    .prop('username', S.string().required())
    .prop('password', S.string().required().minLength(8));

