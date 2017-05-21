import { Document } from '../document'
import { SortData } from './sortdata'
import { WheresData } from './wheresdata'

type QueryData = {
  action?:string
  byId?:string
  count?:boolean
  filters?:((this:void, value:Document, index:number, array:Document[]) => any)[]
  key?:string
  limit?:number
  offset?:number
  populate?:string[]
  select?:string[]
  sort?:SortData[]
  wheres?:WheresData[]
}

export { QueryData }
