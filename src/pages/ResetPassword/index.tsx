import React, { useRef, useCallback, useState } from "react";
import { FiLock } from "react-icons/fi";
import { Form } from "@unform/web";
import { FormHandles } from "@unform/core";
import * as Yup from "yup";
import { Link, useHistory, useLocation } from "react-router-dom";

import { useToast } from "../../hooks/toast";

import getValidationErrors from "../../utils/getValidationErros";

import { Container, Content, Background, AnimationContainer } from "./styles";

import logoImg from "../../assets/logo.svg";

import Input from "../../components/Input";

import Button from "../../components/Button";
import api from "../../services/api";

interface ResetPasswordFormData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const history = useHistory();

  const location = useLocation();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          password: Yup.string().required("Senha obrigatória"),
          passwordConfirmation: Yup.string().oneOf(
            [Yup.ref("password"), null],
            "Confirmação da nova senha não confere com a nova senha."
          ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { password, passwordConfirmation } = data;

        const params = location.search.split("=");
        const [, token] = params;

        if (!token) {
          throw new Error("Token not found");
        }

        setLoading(true);

        await api.post("/password/reset", {
          password,
          passwordConfirmation,
          token,
        });

        history.push("/");
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors = getValidationErrors(error);
          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: "error",
          title: "Erro ao resetar senha.",
          description:
            "Ocorreu um erro no reset da sua senha. Tente mais tarde.",
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast, history, location.search]
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Reset de senha</h1>

            <Input
              name="password"
              type="password"
              icon={FiLock}
              placeholder="Nova senha"
            />

            <Input
              name="passwordConfirmation"
              type="password"
              icon={FiLock}
              placeholder="Confimação da nova senha"
            />

            <Button type="submit" loading={loading}>
              Alterar senha
            </Button>

            <Link to="/">Voltar para o login</Link>
          </Form>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
