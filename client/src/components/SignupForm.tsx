import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import { ADD_USER } from '../utils/mutations'; // Client-side GraphQL mutation
import Auth from '../utils/auth';

interface FormData {
  username: string;
  email: string;
  password: string;
}

const SignupForm = ({}: { handleModalClose: () => void }) => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });
  // State for alert
  const [showAlert, setShowAlert] = useState(false);

  // Set up the mutation hook for ADD_USER
  const [addUser] = useMutation(ADD_USER);

  // Handle input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // Handle form submission
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Execute the ADD_USER mutation and pass the form data as variables
      const { data } = await addUser({
        variables: { input: userFormData },
      });

      // If successful, extract the token and log in the user
      Auth.login(data.addUser.token);
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    // Reset the form
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <>
      <Form noValidate onSubmit={handleFormSubmit}>
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your signup!
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your username"
            name="username"
            value={userFormData.username}
            onChange={handleInputChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
            name="email"
            value={userFormData.email}
            onChange={handleInputChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            value={userFormData.password}
            onChange={handleInputChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Button
          disabled={
            !(userFormData.username && userFormData.email && userFormData.password)
          }
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
