import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { FindTasksDto } from '../dto/find-tasks.dto';
import { Task } from '../entities/task.entity';

@Controller('api/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskDto) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.delete(id);
  }

  @Get('/status/:state')
  async getTasksByStatus(
    @Param('state') state: string,
    @Param() dto: FindTasksDto,
  ) {
    dto.state = state;
    return this.tasksService.findByStatus(dto);
  }

  @Put()
  updateState(@Body() body: UpdateStateDto) {
    body.state = body.state.toUpperCase();
    return this.tasksService.updateTaskStatus(body);
  }

  @Get(':id/days-passed')
  async getDaysSinceCreation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ date_created: string; past_days: number }> {
    return this.tasksService.getDaysSinceCreation(id);
  }
}
