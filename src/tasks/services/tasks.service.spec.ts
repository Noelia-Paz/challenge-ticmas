import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { FindTasksDto } from '../dto/find-tasks.dto';

describe('TasksService', () => {
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

  const mockTaskRepository = {
    find: jest.fn().mockResolvedValue(mockDBTasksResponse),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockDBTasksResponse);
    });

    it('should return an empty array when no tasks are found', async () => {
      mockTaskRepository.find.mockResolvedValueOnce([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const taskId = 1;
      mockTaskRepository.findOneBy.mockResolvedValue(mockTask);
      const result = await service.findOne(taskId);
      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: taskId });
    });

    it('should throw HttpException when taskId is not found', async () => {
      const taskId = 999;
      mockTaskRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(taskId)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );

      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: taskId });
    });
  });

  describe('create', () => {
    it('should save a new task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task description',
      };

      mockTaskRepository.create.mockReturnValue(createTaskDto);
      mockTaskRepository.save.mockResolvedValue(createTaskDto);

      const result = await service.create(createTaskDto);
      expect(result).toEqual(createTaskDto);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { title: createTaskDto.title },
      });
      expect(mockTaskRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(createTaskDto);
    });

    it('should try to create a task with the same title and fail', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task description',
      };

      mockTaskRepository.create.mockReturnValue(createTaskDto);
      mockTaskRepository.save.mockResolvedValue(createTaskDto);
      mockTaskRepository.findOne.mockResolvedValue(createTaskDto);

      await expect(service.create(createTaskDto)).rejects.toThrow(
        new HttpException(
          'There is already a task with that title',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update and return the task if found', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };
      const existingTask = {
        id: 1,
        title: 'Old Task',
        description: 'Old Description',
      };
      const updatedTask = { ...existingTask, ...updateTaskDto };

      mockTaskRepository.findOne.mockReturnValue(existingTask);
      mockTaskRepository.merge.mockResolvedValue(updatedTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);

      expect(await service.update(1, updateTaskDto)).toEqual(updatedTask);
    });

    it('should throw an HttpException if the task to update is not found', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      mockTaskRepository.findOne.mockReturnValue(undefined);

      await expect(service.update(1, updateTaskDto)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const id = 1;
      mockTaskRepository.findOne.mockReturnValue(mockTask);

      const deleteResult = { affected: 1 };
      mockTaskRepository.delete.mockReturnValue(deleteResult);
      const result = await service.delete(id);

      expect(result.message).toEqual('Task successfully deleted');
      expect(result.task).toEqual(mockTask);
      expect(result.result).toEqual(deleteResult);
    });

    it('should throw HttpException if the task to delete is not found', async () => {
      const id = 1;
      mockTaskRepository.findOne.mockReturnValue(undefined);

      await expect(service.delete(id)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('find', () => {
    it('should return tasks with matching state', async () => {
      const findTasksDto: FindTasksDto = { state: 'COMPLETED' };

      mockTaskRepository.find.mockResolvedValue(mockDBTasksResponse);
      const result = await service.findByStatus(findTasksDto);

      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { state: 'COMPLETED' },
      });
      expect(result).toEqual(mockDBTasksResponse);
    });

    it('should return an empty array if no tasks found', async () => {
      const findTasksDto: FindTasksDto = { state: 'COMPLETED' };
      mockTaskRepository.find.mockResolvedValue([]);

      const result = await service.findByStatus(findTasksDto);

      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { state: 'COMPLETED' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('update by status', () => {
    it('should update the task status', async () => {
      const updateStateDto: UpdateStateDto = { id: 1, state: 'COMPLETED' };

      mockTaskRepository.findOne.mockReturnValue(mockTask);
      mockTaskRepository.save.mockReturnValue({
        ...mockTask,
        state: updateStateDto.state,
      });

      const result = await service.updateTaskStatus(updateStateDto);

      expect(result).toEqual({ ...mockTask, state: updateStateDto.state });
    });

    it('should throw HttpException if task is not found', async () => {
      const updateStateDto: UpdateStateDto = { id: 1, state: 'COMPLETED' };
      mockTaskRepository.findOne.mockReturnValue(undefined);

      await expect(service.updateTaskStatus(updateStateDto)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException if task already has the same state', async () => {
      const updateStateDto: UpdateStateDto = { id: 1, state: 'IN_PROGRESS' };
      mockTaskRepository.findOne.mockReturnValue(mockTask);
      await expect(service.updateTaskStatus(updateStateDto)).rejects.toThrow(
        new HttpException(
          'The task already has that state.',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('find by date', () => {
    it('should return the correct number of days since creation', async () => {
      const ParamsId = 1;
      mockTaskRepository.findOneBy.mockReturnValue(mockTask);
      const result = await service.getDaysSinceCreation(ParamsId);

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - mockTask.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const formattedCreatedAt = mockTask.createdAt.toISOString().split('T')[0];

      expect(result).toEqual({
        date_created: formattedCreatedAt,
        past_days: diffDays,
      });
      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTask.id,
      });
    });

    it('should throw an error if the task is not found', async () => {
      const ParamsId = 1;
      mockTaskRepository.findOneBy.mockReturnValue(undefined);

      await expect(service.getDaysSinceCreation(ParamsId)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );

      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTask.id,
      });
    });
  });
});
