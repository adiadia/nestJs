import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'dummy' } as User]);
      },
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'aditya@gmail.com',
          password: 'dymmy',
        } as User);
      },
      remove: (id: number) => {
        return Promise.resolve({
          id,
          email: 'aditya@gmail.com',
          password: 'dymmy',
        } as User);
      },
      update: (id: number, attrs: Partial<User>) => {
        return Promise.resolve({
          id,
          email: attrs.email || 'aditya@gmail.com',
        } as User);
      },
    };
    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('aditya@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('aditya@gmail.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throw an error if given id was not found', async () => {
    fakeUserService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toMatchObject(
      new NotFoundException({
        data: '',
        error: 'Not Found Exception',
        message: 'user not found',
      }),
    );
  });

  it('signin update the session object and return the user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      {
        email: 'aditya@gmail.com',
        password: 'password',
      },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
