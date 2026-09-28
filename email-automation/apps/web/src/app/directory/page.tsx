export default function DirectoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recruiter Directory</h1>
        <p className="text-neutral-400 text-sm mt-1">Verified contacts — unlock emails with credits</p>
      </div>
      {/* TODO: DirectoryList component */}
      <p className="text-neutral-500 text-sm">Loading contacts...</p>
    </div>
  );
}
