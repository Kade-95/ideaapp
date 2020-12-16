import * as mongoose from 'mongoose';

export const IdeaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: new Date().getTime()
    }
});

export const IdeaEntity = {name: 'Idea', schema: IdeaSchema};