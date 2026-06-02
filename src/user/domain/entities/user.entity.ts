import { CreateUserProps } from "../types/create-user-props.type";
import { UserProps } from "../types/user-props.type";
import { randomUUID } from "node:crypto";
import { UserRole } from "../enums/user-role.enum";
import { InvalidNameError } from "../errors/invalid-name-error";
import { InvalidEmailError } from "../errors/invalid-email-error";
import { PasswordRequiredError } from "../errors/password-required-error";

export class User {
  private constructor(private readonly props: UserProps) {}

  public static create(props: CreateUserProps): User {
    const name = this.validateAndNormalizeName(props.name);
    const email = this.validateAndNormalizeEmail(props.email);
    const password = this.validatePassword(props.password);
    return new User({
      id: randomUUID(),
      name: name,
      email: email,
      password: password,
      role: props.role ?? UserRole.ADMIN,
    });
  }

  private static validateAndNormalizeName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");
    if (!normalized.trim()) {
      throw new InvalidNameError("Name can't not be empty");
    }

    if (normalized.length < 2) {
      throw new InvalidNameError("Name too short");
    }

    if (normalized.length > 120) {
      throw new InvalidNameError("Name too long");
    }

    //Verifica caracteres invalidos no name
    const valid = /^[\p{L}\p{M}' -]+$/u.test(normalized);
    if (!valid) {
      throw new InvalidNameError("Invalid characters in name");
    }

    return normalized;
  }

  private static validateAndNormalizeEmail(email: string): string {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      throw new InvalidEmailError("Email is required");
    }

    if (normalizedEmail.length > 254) {
      throw new InvalidEmailError("Invalid email");
    }

    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidFormat) {
      throw new InvalidEmailError("Invalid format");
    }

    return normalizedEmail.toLowerCase();
  }

  changeName(name: string) {
    const normalizedName = User.validateAndNormalizeName(name);

    this.props.name = normalizedName;
  }

  changePassword(password: string) {
    if (!password) {
      throw new PasswordRequiredError("Password required");
    }

    this.props.password = password;
  }

  private static validatePassword(password: string): string {
    const normalizedPassword = password?.trim();

    if (!normalizedPassword) {
      throw new PasswordRequiredError("Password required");
    }

    if (normalizedPassword.length < 8) {
      throw new PasswordRequiredError("Password too short");
    }

    return normalizedPassword;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get role() {
    return this.props.role;
  }

  get password() {
    return this.props.password;
  }
}
