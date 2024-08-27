/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Expose } from 'class-transformer'
import { Request } from 'express'
import { Pagination } from '../utils/response'

export class BaseDTO {
    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
}

export class BaseReqDTO {
    bind?(req: Request): void {}
}

export class DataReqDTO extends BaseReqDTO {
    pagination?: Pagination

    bind?(req: Request): void {
        this.pagination = Pagination.fromReq(req)
    }
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}
