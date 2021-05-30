import React, { ChangeEvent, useCallback, useRef } from "react";
import { FiMail, FiLock, FiUser, FiCamera, FiArrowLeft } from "react-icons/fi";
import { Form } from "@unform/web";
import { FormHandles } from "@unform/core";
import * as Yup from "yup";
import { Link, useHistory } from "react-router-dom";

import api from "../../services/api";

import { useToast } from "../../hooks/toast";

import { AvatarInput, Container, Content } from "./styles";

import Input from "../../components/Input";

import Button from "../../components/Button";

import getValidationErrors from "../../utils/getValidationErros";
import { useAuth } from "../../hooks/auth";

interface ProfileFormData {
  name: string;
  email: string;
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const history = useHistory();

  const { user, updateUser } = useAuth();

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.files);

      if (e.target.files) {
        const formData = new FormData();

        formData.append("avatar", e.target.files[0]);

        api.patch("/users/avatar", formData).then((response) => {
          updateUser(response.data);

          addToast({
            type: "success",
            title: "Avatar atualizado com sucesso!",
          });
        });
      }
    },
    [addToast, updateUser]
  );

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required("Nome obrigatório"),
          email: Yup.string()
            .required("E-mail obrigatório")
            .email("Informe um e-mail válido"),
          oldPassword: Yup.string(),
          password: Yup.string().when("oldPassword", {
            is: (val: string) => !!val.length,
            then: Yup.string()
              .required("Senha obrigatória")
              .min(6, "Senha deve conter pelo menos 6 caracteres"),
            otherwise: Yup.string(),
          }),
          passwordConfirmation: Yup.string()
            .when("oldPassword", {
              is: (val: string) => !!val.length,
              then: Yup.string()
                .required("Senha obrigatória")
                .min(6, "Senha deve conter pelo menos 6 caracteres"),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref("password"), null],
              "Confirmação da nova senha não confere com a nova senha."
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { name, email, oldPassword, password, passwordConfirmation } =
          data;

        const formData = Object.assign(
          { name, email },
          oldPassword ? { oldPassword, password, passwordConfirmation } : {}
        );

        const response = await api.put("/profile", formData);

        updateUser(response.data);

        history.push("/dashboard");

        addToast({
          type: "success",
          title: "Perfil atualizado com sucesso!",
          description: "Suas informações foram atualizadas.",
        });
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors = getValidationErrors(error);
          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: "error",
          title: "Erro na atualização.",
          description: "Ocorreu um erro na atualização, tente novamente.",
        });
      }
    },
    [addToast, history]
  );

  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>

      <Content>
        <Form
          ref={formRef}
          initialData={{
            name: user.name,
            email: user.email,
          }}
          onSubmit={handleSubmit}
        >
          <AvatarInput>
            <img src={user.avatarUrl} alt={user.name} />
            <label htmlFor="avatar">
              <FiCamera />
              <input type="file" id="avatar" onChange={handleAvatarChange} />
            </label>
          </AvatarInput>

          <h1>Meu perfil</h1>

          <Input name="name" icon={FiUser} placeholder="Nome" />

          <Input name="email" icon={FiMail} placeholder="E-mail" />

          <Input
            name="oldPassword"
            type="password"
            icon={FiLock}
            placeholder="Senha atual"
            containerStyle={{ marginTop: 28 }}
          />

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
            placeholder="Confirmar senha"
          />

          <Button type="submit">Confirmar mudanças</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;
