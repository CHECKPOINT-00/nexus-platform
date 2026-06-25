export enum IntakeStep {
  PACKAGE = 0,
  IDEA = 1,
  PAIN_POINT = 2,
  CUSTOMER = 3,
  DRIVE_URL = 4,
  REVIEW = 5,
}

export interface IntakeData {
  package_id: string;
  idea: string;
  pain_point: string;
  customer: string;
  drive_url: string;
  team_name: string;
  school: string;
  course_context: string;
}
