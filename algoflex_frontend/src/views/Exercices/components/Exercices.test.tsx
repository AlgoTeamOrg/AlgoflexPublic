import React from 'react';
import Exercices from './Exercices';
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

test.todo("Make Exercices tests");

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
    useParams: () => ({
      pageId: "1234"
    }),
    useRouteMatch: () => ({ url: 'http://localhost:3000/theme/1234' }),
  }));


it("Renders correctly", () => {
    const view = render(<Exercices />);
    expect(view).toMatchSnapshot();
  });

describe('Exercices', () => {
    it('Should work !', () => {
        render(<Exercices />);
    });
});