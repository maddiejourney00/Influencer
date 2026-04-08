import { redirect } from "next/navigation";

export default function Home() {
  redirect("/wizard/step-1-upload");
}
