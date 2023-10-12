import { CloseRounded } from "@mui/icons-material";

const MediaPreview = ({src, closePreview}) => {
    if (!src) return null;

    return (
        <div className="mediaPreview">
            <CloseRounded onClick={closePreview}/>
            <img src={src} alt="preview" />
        </div>
    )
}

export default MediaPreview;