import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IdeaController } from "./idea.controller";
import { IdeaEntity, IdeaSchema } from "./idea.model";
import { IdeaService } from "./idea.service";

@Module({
    imports: [MongooseModule.forFeature([IdeaEntity])],
    controllers: [IdeaController],
    providers: [IdeaService]
})
export class IdeaModule { };