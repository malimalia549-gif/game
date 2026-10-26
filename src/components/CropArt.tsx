import type { CropId } from "../game/content";

export function CropArt({ id, stage }: { id: CropId; stage: 1 | 2 | 3 }) {
  return (
    <div className={`crop crop-${id} stage-${stage}`} aria-hidden>
      {id === "wheat" && (
        <div className="stalks">
          <i />
          <i />
          <i />
        </div>
      )}
      {id === "tomato" && (
        <>
          <div className="leaves">
            <i className="leaf" />
            <i className="leaf" />
          </div>
          <i className="fruit a" />
          <i className="fruit b" />
        </>
      )}
      {id === "carrot" && (
        <>
          <div className="leaves">
            <i className="leaf" />
            <i className="leaf" />
          </div>
          <i className="root" />
        </>
      )}
      {id === "corn" && (
        <>
          <div className="leaves">
            <i className="leaf" />
          </div>
          <i className="ear" />
        </>
      )}
    </div>
  );
}
