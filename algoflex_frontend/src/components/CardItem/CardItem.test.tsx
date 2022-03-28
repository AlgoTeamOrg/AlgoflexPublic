import React from 'react';
import CardItem from './CardItem';
import { render, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";

test.todo("Make CardItem tests");

const testingProps = {
    uid: 1,
    name: "Test",
    description: "TestDesc",
    imageUrl: "TestUrl",
    exerciseCount: 1,
    finishedExerciseCount: 1,
    favoriteStatus: true
}

it("Renders correctly", () => {
    const { queryByTest } = render(<CardItem />);
    expect(queryByTest).toMatchSnapshot();
});

describe('CardItem', () => {
    it('should work !', () => {
        render(<CardItem/>);
    });
});

