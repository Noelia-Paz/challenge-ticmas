import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { FindTasksDto } from '../dto/find-tasks.dto';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private tasksRepo: Repository<Task>) {}

  findAll() {
    return this.tasksRepo.find();
  }

  async findOne(id: number) {
    const taskFound = await this.tasksRepo.findOneBy({ id });
    if (!taskFound) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return taskFound;
  }

  async create(body: CreateTaskDto) {
    const taskFound = await this.tasksRepo.findOne({
      where: { title: body.title },
    });

    if (taskFound) {
      throw new HttpException(
        'There is already a task with that title',
        HttpStatus.CONFLICT,
      );
    }
    const newTask = this.tasksRepo.create(body);
    return this.tasksRepo.save(newTask);
  }

  async update(id: number, body: UpdateTaskDto) {
    const taskFound = await this.tasksRepo.findOne({
      where: { id },
    });

    if (!taskFound) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    this.tasksRepo.merge(taskFound, body);
    return this.tasksRepo.save(taskFound);
  }

  async delete(id: number) {
    const taskFound = await this.tasksRepo.findOne({
      where: { id },
    });

    if (!taskFound) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.tasksRepo.delete({ id });

    const response = {
      message: 'Task successfully deleted',
      task: taskFound,
      result,
    };

    return response;
  }

  async findByStatus(dto: FindTasksDto): Promise<Task[]> {
    const { state } = dto;

    const tasksFound = await this.tasksRepo.find({ where: { state } });

    return tasksFound ?? [];
  }

  async updateTaskStatus(body: UpdateStateDto) {
    const taskFound = await this.tasksRepo.findOne({
      where: { id: body.id },
    });

    if (!taskFound) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    if (taskFound.state === body.state) {
      throw new HttpException(
        'The task already has that state.',
        HttpStatus.CONFLICT,
      );
    }

    this.tasksRepo.merge(taskFound, body);
    return this.tasksRepo.save(taskFound);
  }

  async getDaysSinceCreation(
    id: number,
  ): Promise<{ date_created: string; past_days: number }> {
    const task = await this.tasksRepo.findOneBy({ id });
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - task.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedCreatedAt = task.createdAt.toISOString().split('T')[0];

    return { date_created: formattedCreatedAt, past_days: diffDays };
  }
}
