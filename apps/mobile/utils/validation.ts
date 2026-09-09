export interface FieldErrors {
  [fieldName: string]: string | undefined;
}

// --- Form value interfaces ---

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface PurchaseFormValues {
  description: string;
  amount: number | null;
  date: string;
  purchase_type_id: string;
  payment_type_id: string;
  credit_card_id: string;
  installments: number | null;
  is_credit_card_payment: boolean;
}

export interface ExpenseFormValues {
  description: string;
  amount: number | null;
  date: string;
  payment_type_id: string;
}

export interface EarningFormValues {
  description: string;
  amount: number | null;
  date: string;
}

export interface CreditCardFormValues {
  person_id: string;
  last_four_digits: string;
  card_type: string;
  closing_day: number | null;
  due_date: number | null;
  name: string;
}

export interface PurchaseTypeFormValues {
  name: string;
}

export interface PaymentTypeFormValues {
  name: string;
}

export interface PersonFormValues {
  name: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface InviteFormValues {
  email: string;
}

// --- Helpers ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

// --- Validation functions ---

export function validateLoginForm(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  if (!values.password) {
    errors.password = 'Senha é obrigatória';
  }

  return errors;
}

export function validateRegisterForm(values: RegisterFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  if (!values.password) {
    errors.password = 'Senha é obrigatória';
  } else if (values.password.length < 6) {
    errors.password = 'Senha deve ter no mínimo 6 caracteres';
  }

  if (!values.passwordConfirmation) {
    errors.passwordConfirmation = 'Confirmação de senha é obrigatória';
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = 'Senhas não conferem';
  }

  return errors;
}

export function validateForgotPasswordForm(values: ForgotPasswordFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  return errors;
}

export function validatePurchaseForm(values: PurchaseFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.description.trim()) {
    errors.description = 'Descrição é obrigatória';
  } else if (values.description.length > 200) {
    errors.description = 'Máximo 200 caracteres';
  }

  if (values.amount === null || values.amount === undefined) {
    errors.amount = 'Valor é obrigatório';
  } else if (values.amount < 0.01) {
    errors.amount = 'Valor deve ser maior que zero';
  } else if (values.amount > 999999999.99) {
    errors.amount = 'Valor excede o limite';
  }

  if (!values.date) {
    errors.date = 'Data é obrigatória';
  }

  if (!values.purchase_type_id) {
    errors.purchase_type_id = 'Tipo de compra é obrigatório';
  }

  if (!values.payment_type_id) {
    errors.payment_type_id = 'Tipo de pagamento é obrigatório';
  }

  if (values.is_credit_card_payment) {
    if (!values.credit_card_id) {
      errors.credit_card_id = 'Cartão de crédito é obrigatório';
    }

    if (values.installments === null || values.installments === undefined) {
      errors.installments = 'Número de parcelas é obrigatório';
    } else if (values.installments < 1 || values.installments > 48) {
      errors.installments = 'Parcelas devem ser entre 1 e 48';
    }
  }

  return errors;
}

export function validateExpenseForm(values: ExpenseFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.description.trim()) {
    errors.description = 'Descrição é obrigatória';
  } else if (values.description.length > 200) {
    errors.description = 'Máximo 200 caracteres';
  }

  if (values.amount === null || values.amount === undefined) {
    errors.amount = 'Valor é obrigatório';
  } else if (values.amount < 0.01) {
    errors.amount = 'Valor deve ser maior que zero';
  } else if (values.amount > 999999999.99) {
    errors.amount = 'Valor excede o limite';
  }

  if (!values.date) {
    errors.date = 'Data é obrigatória';
  }

  if (!values.payment_type_id) {
    errors.payment_type_id = 'Tipo de pagamento é obrigatório';
  }

  return errors;
}

export function validateEarningForm(values: EarningFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.description.trim()) {
    errors.description = 'Descrição é obrigatória';
  } else if (values.description.length > 100) {
    errors.description = 'Máximo 100 caracteres';
  }

  if (values.amount === null || values.amount === undefined) {
    errors.amount = 'Valor é obrigatório';
  } else if (values.amount < 0.01) {
    errors.amount = 'Valor deve ser maior que zero';
  } else if (values.amount > 999999999.99) {
    errors.amount = 'Valor excede o limite';
  }

  if (!values.date) {
    errors.date = 'Data é obrigatória';
  }

  return errors;
}

export function validateCreditCardForm(values: CreditCardFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.person_id) {
    errors.person_id = 'Pessoa é obrigatória';
  }

  if (!values.last_four_digits) {
    errors.last_four_digits = 'Últimos 4 dígitos são obrigatórios';
  } else if (!/^\d{4}$/.test(values.last_four_digits)) {
    errors.last_four_digits = 'Deve conter exatamente 4 dígitos numéricos';
  }

  if (!values.card_type) {
    errors.card_type = 'Tipo do cartão é obrigatório';
  }

  if (values.closing_day === null || values.closing_day === undefined) {
    errors.closing_day = 'Dia de fechamento é obrigatório';
  } else if (values.closing_day < 1 || values.closing_day > 31) {
    errors.closing_day = 'Dia de fechamento deve ser entre 1 e 31';
  }

  if (values.due_date === null || values.due_date === undefined) {
    errors.due_date = 'Dia de vencimento é obrigatório';
  } else if (values.due_date < 1 || values.due_date > 31) {
    errors.due_date = 'Dia de vencimento deve ser entre 1 e 31';
  }

  if (values.name && values.name.length > 50) {
    errors.name = 'Máximo 50 caracteres';
  }

  return errors;
}

export function validatePurchaseTypeForm(values: PurchaseTypeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (values.name.length > 50) {
    errors.name = 'Máximo 50 caracteres';
  }

  return errors;
}

export function validatePaymentTypeForm(values: PaymentTypeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (values.name.length > 50) {
    errors.name = 'Máximo 50 caracteres';
  }

  return errors;
}

export function validatePersonForm(values: PersonFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  return errors;
}

export function validateProfileForm(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  return errors;
}

export function validateInviteForm(values: InviteFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (values.email.trim().length > 254) {
    errors.email = 'E-mail deve ter no máximo 254 caracteres';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  return errors;
}
