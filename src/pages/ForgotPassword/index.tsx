import React, { useRef, useCallback, useState } from "react";
import { FiLogIn, FiMail } from "react-icons/fi";
import { Form } from "@unform/web";
import { FormHandles } from "@unform/core";
import * as Yup from "yup";
import { Link, useHistory } from "react-router-dom";

import { useToast } from "../../hooks/toast";

import getValidationErrors from "../../utils/getValidationErros";

import { Container, Content, Background, AnimationContainer } from "./styles";

import logoImg from "../../assets/logo.svg";

import Input from "../../components/Input";

import Button from "../../components/Button";
import api from "../../services/api";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const history = useHistory();

  const handleSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required("E-mail obrigatório")
            .email("Informe um e-mail válido"),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        setLoading(true);

        await api.post("/password/forgot", {
          email: data.email,
        });

        addToast({
          type: "success",
          title: "Recuperação de senha",
          description: "E-mail de recuperação de senha enviado com sucesso.",
        });

        history.push("/dashboard");
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors = getValidationErrors(error);
          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: "error",
          title: "Erro na recuperação de senha",
          description:
            "Ocorreu um erro na recuperação de senha, tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast, history]
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Recuperação de senha</h1>

            <Input name="email" icon={FiMail} placeholder="E-mail" />

            <Button type="submit" loading={loading}>
              Recuperar
            </Button>
          </Form>

          <Link to="/">
            <FiLogIn />
            Voltar para o login
          </Link>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ForgotPassword;
