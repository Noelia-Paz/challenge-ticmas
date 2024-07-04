import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from '../services/tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { FindTasksDto } from '../dto/find-tasks.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;
  let repo: Repository<Task>;

  const mockDBTasksResponse = [
    {
      id: 3,
      title: 'Task1',
      description: 'Description1',
      state: 'COMPLETED',
      createdAt: new Date('2024-07-01T19:00:33.554Z'),
    },
  ];

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Testing',
    state: 'IN_PROGRESS',
    createdAt: new Date('2024-07-01T19:00:33.554Z'),
  };

  const mockTasksService = {
    findAll: jest.fn().mockResolvedValue(mockDBTasksResponse),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByStatus: jest.fn(),
    updateTaskStatus: jest.fn(),
    getDaysSinceCreation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all tasks', async () => {
    const result = await controller.getAll();
    expect(result).toEqual(mockDBTasksResponse);
  });

  it('should return an empty array if no tasks found', async () => {
    mockTasksService.findAll.mockResolvedValue([]);

    const result = await controller.getAll();
    expect(result).toEqual([]);
  });

  it('should return a task by id', async () => {
    const id = 1;
    mockTasksService.findOne.mockResolvedValue(mockTask);

    const result = await controller.getOne(id);
    expect(result).toEqual(mockTask);
  });

  it('should create a task', async () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Task 1',
      description: 'Description Task 1',
    };

    const newMockTask = {
      ...mockTask,
      title: createTaskDto.title,
      description: createTaskDto.description,
    };

    mockTasksService.create.mockResolvedValue(newMockTask);

    const result = await controller.create(createTaskDto);
    expect(result).toEqual(newMockTask);
    expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
  });

  it('should update a task', async () => {
    const updateTaskDto: UpdateTaskDto = {
      title: 'Task Updated',
      description: 'Desription Updated',
    };
    const id = 1;
    const newMockTask = {
      ...mockTask,
      ...updateTaskDto,
    };

    mockTasksService.update.mockResolvedValue(newMockTask);

    const result = await controller.update(id, updateTaskDto);
    expect(result).toEqual(newMockTask);

    expect(mockTasksService.update).toHaveBeenCalledWith(id, updateTaskDto);
  });

  it('should delete a task by id', async () => {
    const id = 1;

    mockTasksService.delete.mockResolvedValue({ affected: 1 });

    const result = await controller.delete(id);
    expect(result).toEqual({ affected: 1 });
    expect(mockTasksService.delete).toHaveBeenCalledWith(id);
  });

  it('should bring all tasks by state', async () => {
    const state = 'COMPLETED';
    const findTasksDto: FindTasksDto = { state };

    mockTasksService.findByStatus.mockResolvedValue(mockDBTasksResponse);

    const result = await controller.getTasksByStatus(state, findTasksDto);
    expect(result).toEqual(mockDBTasksResponse);
    expect(mockTasksService.findByStatus).toHaveBeenCalledWith(findTasksDto);
  });

  it('should update the status of the task', async () => {
    const updateStateDto: UpdateStateDto = { id: 1, state: 'COMPLETED' };
    const newMockTask = {
      ...mockTask,
      state: updateStateDto.state,
    };

    mockTasksService.updateTaskStatus.mockResolvedValue(newMockTask);

    const response = await controller.updateState(updateStateDto);

    expect(mockTasksService.updateTaskStatus).toHaveBeenCalledWith(
      updateStateDto,
    );
    expect(response).toEqual(newMockTask);
  });

  it('should return days passed since task creation', async () => {
    const id = 1;
    const expectedResult = { date_created: '2023-01-01', past_days: 10 };

    mockTasksService.getDaysSinceCreation.mockResolvedValue(expectedResult);
    const result = await controller.getDaysSinceCreation(id);

    expect(mockTasksService.getDaysSinceCreation).toHaveBeenCalledWith(id);
    expect(result).toEqual(expectedResult);
  });
});
