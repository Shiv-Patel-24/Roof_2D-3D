export const UploadedFilePanel = ({
  uploadedFiles,
  activeFileName,
  onSelectFile
}: {
  uploadedFiles: { name: string; xml: string }[];
  activeFileName: string | null;
  onSelectFile: (name: string) => void;
}) => {
  return (
    <div className="w-[260px] bg-white shadow-xl p-4 border-l">
      <h3 className="font-bold text-lg mb-3">Uploaded Files</h3>

      {uploadedFiles.length === 0 && (
        <p className="text-gray-400">No files uploaded.</p>
      )}

      <ul className="space-y-2">
        {uploadedFiles.map((file) => (
          <li
            key={file.name}
            onClick={() => onSelectFile(file.name)}
            className={`p-2 rounded cursor-pointer ${
              activeFileName === file.name
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
