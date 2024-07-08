import { Quote } from "../components/Quotes";

export const Signup = () => {
  return (
    <div>
      <div className="grid grid-cols-2">
        <div></div>
        <div className="invisible lg:visible">
          <Quote />
        </div>
      </div>
    </div>
  );
};
