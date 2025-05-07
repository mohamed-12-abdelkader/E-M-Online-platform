import StreamList from "./list";
import MyStreams from "./myStreams";
import StreamState from "./streamState";

function StreamPage() {
  return (
    <>
      <StreamState />
      <MyStreams />
      <StreamList />
    </>
  );
}

export default StreamPage;
