import { Input } from "@heroui/react";

interface StepContextProps {
  teamName: string;
  school: string;
  courseContext: string;
  onTeamNameChange: (v: string) => void;
  onSchoolChange: (v: string) => void;
  onCourseContextChange: (v: string) => void;
}

export function StepContext({
  teamName, school, courseContext,
  onTeamNameChange, onSchoolChange, onCourseContextChange,
}: StepContextProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="team-name" className="text-sm font-bold text-default-700">
          Tên nhóm dự án (nếu có)
        </label>
        <Input
          id="team-name"
          placeholder="Ví dụ: Team Startup Alpha"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="school" className="text-sm font-bold text-default-700">
          Trường / Cơ sở học tập
        </label>
        <Input
          id="school"
          placeholder="Ví dụ: FPT University Đà Nẵng"
          value={school}
          onChange={(e) => onSchoolChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="course" className="text-sm font-bold text-default-700">
          Môn học / Ngữ cảnh dự án
        </label>
        <Input
          id="course"
          placeholder="Ví dụ: Môn khởi nghiệp EXE101"
          value={courseContext}
          onChange={(e) => onCourseContextChange(e.target.value)}
        />
      </div>
    </div>
  );
}
