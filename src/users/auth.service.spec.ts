import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      find: (email: any) => {
        const filteredUsers = users.filter((user) => user.email == email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('adi@gmail.com', 'password');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if email already in use', async () => {
    await service.signup('adi@gmail.com', 'mypassword');
    await expect(
      service.signup('adi@gmail.com', 'password'),
    ).rejects.toMatchObject(
      new NotFoundException({
        data: '',
        error: 'Not Found Exception',
        message: 'email in use',
      }),
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('aditya@gmail.com', 'pass'),
    ).rejects.toMatchObject(
      new NotFoundException({
        data: '',
        error: 'Not Found Exception',
        message: 'user not found',
      }),
    );
  });

  it('throws if invalid password is provided', async () => {
    await service.signup('adi@gmail.com', 'mypassword');

    await expect(
      service.signin('adi@gmail.com', 'password'),
    ).rejects.toMatchObject(
      new BadRequestException({
        data: '',
        error: 'Bad Request Exception',
        message: 'bad password',
      }),
    );
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('adi@gmail.com', 'mypassword');
    const user = await service.signin('adi@gmail.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
