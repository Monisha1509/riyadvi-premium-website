import mongoose from 'mongoose';
const leadSchema=new mongoose.Schema({
 type:{type:String,required:true,enum:['contact','consultation','health-checkup','lead-magnet','application']},
 name:{type:String,required:true,trim:true,maxlength:120},email:{type:String,required:true,trim:true,lowercase:true,maxlength:254},phone:{type:String,trim:true,maxlength:40},company:{type:String,trim:true,maxlength:160},requirement:{type:String,trim:true,maxlength:120},message:{type:String,trim:true,maxlength:5000},website:{type:String,trim:true,maxlength:500},challenge:{type:String,trim:true,maxlength:2000},marketing:{type:String,trim:true,maxlength:100},technology:{type:String,trim:true,maxlength:200},position:{type:String,trim:true,maxlength:160},healthAnswers:{type:Map,of:String,default:undefined},healthScore:{type:Number,min:0,max:100},resume:{originalName:String,filename:String,mimetype:String,size:Number},
 status:{type:String,enum:['new','contacted','qualified','closed'],default:'new'},statusUpdatedAt:{type:Date},statusUpdatedBy:{type:String},source:{type:String,default:'website'},createdAt:{type:Date,default:Date.now}
},{timestamps:true,strict:true});
leadSchema.index({createdAt:-1});leadSchema.index({type:1,status:1});leadSchema.index({email:1,createdAt:-1});
export default mongoose.models.Lead||mongoose.model('Lead',leadSchema);
