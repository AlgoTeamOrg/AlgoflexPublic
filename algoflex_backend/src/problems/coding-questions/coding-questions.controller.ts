import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard, Role, Roles, RolesGuard } from 'src/common';
import { CodingQuestionsService } from './coding-questions.service';
import { CreateCodingQuestionDto } from './dto/create-coding-question.dto';
import { UpdateCodingQuestionDto } from './dto/update-coding-question.dto';
import { CodingQuestion } from './entities/coding-question.entity';

interface FindAllCodingQuestionQuery {
  theme: string;
}

@UseGuards(FirebaseAuthGuard, RolesGuard)
@ApiTags('Coding questions')
@Controller('problems/coding-questions')
export class CodingQuestionsController {
  constructor(private readonly codingQuestionsService: CodingQuestionsService) {}

  @Get()
  findAll(@Query() query?: FindAllCodingQuestionQuery) {
    if (query?.theme) {
      return this.codingQuestionsService.findByTheme(query.theme);
    }
    return this.codingQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codingQuestionsService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiResponse({
    status: 200,
    type: CodingQuestion,
    description: 'Create a coding question.',
  })
  @ApiResponse({
    status: 409,
    description: 'Returns 409 when the problem already exists.',
  })
  @Post()
  create(@Body() createCodingQuestionDto: CreateCodingQuestionDto) {
    return this.codingQuestionsService.create(createCodingQuestionDto);
  }

  @Roles(Role.Admin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCodingQuestionDto: UpdateCodingQuestionDto) {
    return this.codingQuestionsService.update(id, updateCodingQuestionDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codingQuestionsService.remove(id);
  }
}
