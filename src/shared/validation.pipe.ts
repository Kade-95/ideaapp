import { ArgumentMetadata, BadRequestException, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {

        if (value instanceof Object && this.isEmpty(value)) {
            throw new HttpException("Validation failed: No body submitted", HttpStatus.BAD_REQUEST);
        }

        const { metatype } = metadata;

        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToClass(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            throw new HttpException(`Validation failed: ${this.formatErrors(errors)}`, HttpStatus.BAD_REQUEST);
        }
        return value;
    }

    private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find(type => type === metatype);
    }

    private formatErrors(errors: any[]) {
        return errors.map(err => {
            for (let props in err.constraints) {
                return err.constraints[props];
            }
        }).join(', ');
    }

    private isEmpty(value: any) {
        return Object.keys(value).length <= 0;
    }
}