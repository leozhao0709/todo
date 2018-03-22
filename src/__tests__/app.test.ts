import * as supertest from 'supertest';
import { expect } from 'chai';
import { app } from '../app';
import Todo from '../models/Todo';
import { ObjectID } from 'bson';

const request = supertest(app);

const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo'
    },
    {
        _id: new ObjectID(),
        text: 'Second test todo'
    }
];

beforeEach(() => {
    return Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    });
});

describe('Post /todos', () => {

    it('should create a new todo', async () => {
        const text = 'Test todo text';
        const res = await request.post('/todos').send({ text }).expect(200);
        expect(res.body.text).eqls(text);
    });

    it('should not create a todo with invalid data', async () => {
        await request.post('/todos').send({}).expect(400);

        const testTodos = await Todo.find();
        expect(testTodos.length).eq(2);
    });
});

describe('Get /todos', () => {
    it('should get all todos', async () => {
        const res = await request.get('/todos').expect(200);
        expect(res.body.todos.length).eq(2);
    });
});

describe('Get /todo/:id', () => {
    it('should return todo doc', async () => {
        const res = await request.get(`/todo/${todos[0]._id}`).expect(200);
        expect(res.body.todo.text).equals(todos[0].text);
    });

    it('should return 404 if todo not found', async () => {
        await request.get(`/todo/${new ObjectID()}`).expect(404);
    });

    it('should return 404 if non-object ids', async () => {
        await request.get('/todo/123abc').expect(404);
    });
});