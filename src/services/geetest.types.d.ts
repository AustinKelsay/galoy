type CaptchaError = import("@domain/captcha/error").CaptchaError
type UnknownCaptchaError = import("@domain/captcha/error").UnknownCaptchaError

type GeetestRegister = {
  success: number
  gt: string
  challenge: string
  newCaptcha: boolean
}

type GeetestType = {
  register: () => Promise<UnknownCaptchaError | GeetestRegister>
  validate: (
    challenge: string,
    validate: string,
    seccode: string,
  ) => Promise<true | CaptchaError>
}
