import mongoose, {Decimal128, Mixed, Schema} from 'mongoose'
import type {Document, Types} from 'mongoose'
const {model, SchemaTypes} = mongoose

export interface RatingModel {
  id: string
  createdAt: Date
  updatedAt: Date
  firebaseAuthID: string
  value: Decimal128
}

export interface RatingDocument extends Document<Types.ObjectId>, RatingModel {
  id: string
}

const schema = new Schema<RatingDocument>({
  firebaseAuthID: {type: String},
  value: SchemaTypes.Decimal128,
})
schema.index({firebaseAuthID: 1})
schema.index({createdAt: 1})

export const RatingSchema = schema
export const Rating = model<RatingDocument>('Rating', schema, 'Rating')
