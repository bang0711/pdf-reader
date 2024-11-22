import DocumentHistory from "@/components/document-history";
import UploadFile from "@/components/upload-file";

function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-3 p-3">
      <UploadFile />
      <DocumentHistory />
    </div>
  );
}

export default HomePage;
