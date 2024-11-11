
using job from '../db/jobs';

service scheduler {

entity jobs1 as projection on job.JOBS;

function jobs() returns String;
    

}