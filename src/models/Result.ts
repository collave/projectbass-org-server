import mongoose, {Mixed, Schema} from 'mongoose'
import type {Document, Types} from 'mongoose'
const {model, SchemaTypes} = mongoose

export interface ResultModel {
  id: string
  createdAt: Date
  updatedAt: Date
  firebaseAuthID: string
  request: any
  payload: any
}

export interface ResultDocument extends Document<Types.ObjectId>, ResultModel {
  id: string
}

const schema = new Schema<ResultDocument>({
  firebaseAuthID: {type: String},
  request: SchemaTypes.Mixed,
  payload: SchemaTypes.Mixed,
})
schema.index({firebaseAuthID: 1})
schema.index({createdAt: 1})

export const ResultSchema = schema
export const Result = model<ResultDocument>('Result', schema, 'Result')
