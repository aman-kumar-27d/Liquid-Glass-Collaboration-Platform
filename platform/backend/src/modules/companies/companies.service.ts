import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './companies.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>
  ) {}

  async findAll() {
    const companies = await this.companiesRepository.find({ order: { createdAt: 'DESC' } });
    return { success: true, data: companies, error: null, meta: null };
  }

  async create(dto: CreateCompanyDto) {
    const company = this.companiesRepository.create({
      name: dto.name,
      domain: dto.domain,
      plan: 'trial'
    });
    const saved = await this.companiesRepository.save(company);
    return { success: true, data: saved, error: null, meta: null };
  }

  async findOne(id: string) {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return { success: true, data: company, error: null, meta: null };
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.companiesRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    Object.assign(company, dto);
    const saved = await this.companiesRepository.save(company);
    return { success: true, data: saved, error: null, meta: null };
  }
}
