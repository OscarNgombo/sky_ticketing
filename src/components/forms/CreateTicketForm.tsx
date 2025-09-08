import React, { useState, type ChangeEvent } from "react";
import Button from "../buttons/Button.tsx";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AttachmentClipIcon,
  BoldIcon,
  ClearFormatting2Icon,
  ClearFormattingIcon,
  CodeIcon,
  FontSize2Icon,
  FontSize3Icon,
  FontSize4Icon,
  FontSizeIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  QuoteIcon,
  RemoveFileIcon,
  Strikethrough2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  VideoIcon,
} from "../../icons/TicketEditorIcons.tsx";
import "./CreateTicketForm.css";

interface CreateTicketFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  interface FormData {
    mainCategory: string;
    subCategory: string;
    problem: string;
    description: string;
  }

  interface FormErrors {
    mainCategory?: string;
    subCategory?: string;
    problem?: string;
    description?: string;
    attachment?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    mainCategory: "",
    subCategory: "",
    problem: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      if (errors.attachment) {
        setErrors((prev) => ({ ...prev, attachment: undefined }));
      }
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.mainCategory.trim())
      newErrors.mainCategory = "Main category is required.";
    if (!formData.subCategory.trim())
      newErrors.subCategory = "Sub category is required.";
    if (!formData.problem.trim())
      newErrors.problem = "Problem/Issue is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";

    // File validation
    const MAX_FILES = 5;
    const MAX_SIZE_MB = 2;
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".pdf", ".png"];

    if (files.length > MAX_FILES) {
      newErrors.attachment = `You can upload a maximum of ${MAX_FILES} files.`;
    } else {
      for (const file of files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          newErrors.attachment = `File "${file.name}" exceeds the maximum size of ${MAX_SIZE_MB}MB.`;
          break;
        }
        const fileExtension = file.name
          .slice(file.name.lastIndexOf("."))
          .toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
          newErrors.attachment = `File type for "${
            file.name
          }" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCreate = () => {
    if (validateForm()) {
      console.log("Form is valid, submitting...", { formData, files });
      // Here you would typically construct FormData and send it to an API
      onSubmit?.();
    } else {
      console.log("Form is invalid.");
    }
  };
  return (
    <div className="create-ticket-form-container">
      <form className="create-ticket-form">
        <label htmlFor="main-category">Main category</label>
        <input
          type="text"
          name="mainCategory"
          id="main-category"
          placeholder="Sky Portal"
          value={formData.mainCategory}
          onChange={handleChange}
        />
        {errors.mainCategory && (
          <p className={"error"}>{errors.mainCategory}</p>
        )}
        <label htmlFor="sub-category">Sub category</label>
        <input
          type="text"
          name="subCategory"
          id="sub-category"
          placeholder="User Administration"
          value={formData.subCategory}
          onChange={handleChange}
        />
        {errors.subCategory && <p className="error">{errors.subCategory}</p>}

        <label htmlFor="problem">Problem/Issue</label>
        <input
          type="text"
          name="problem"
          id="problem"
          placeholder="Deactivate User"
          value={formData.problem}
          onChange={handleChange}
        />
        {errors.problem && <p className="error">{errors.problem}</p>}
        <label htmlFor="description">Description</label>
        <div className={"textAreaIcons"}>
          <div>
            <BoldIcon />
            <ItalicIcon />
            <UnderlineIcon />
            <StrikethroughIcon />
            <Strikethrough2Icon />
          </div>

          <div>
            <FontSizeIcon />
            <FontSize2Icon />
            <FontSize3Icon />
            <FontSize4Icon />
          </div>

          <div>
            <ListUnorderedIcon />
            <ListOrderedIcon />
          </div>

          <div>
            <LinkIcon />
            <ImageIcon />
            <VideoIcon />
            <QuoteIcon />
            <CodeIcon />
          </div>

          <div>
            <AlignLeftIcon />
            <AlignCenterIcon />
            <AlignRightIcon />
          </div>
          <div>
            <ClearFormattingIcon />
            <ClearFormatting2Icon />
          </div>
        </div>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder=""
        />
        {errors.description && <p className="error">{errors.description}</p>}
        <label htmlFor="attachment">Attachment</label>
        <input
          type="file"
          name="attachment"
          id="attachment"
          style={{ display: "none" }}
          onChange={handleFileChange}
          multiple
          accept=".jpg,.jpeg,.pdf,.png"
        />
        <label htmlFor={"attachment"} className={"file-upload-button"}>
          Select File(s)
        </label>
        <p className={"file-upload-button-par"}>
          Allowed file extensions: <strong> .jpg, .jpeg, .pdf, .png</strong>
          <br /> Maximum File Size: <strong>2MB</strong>
          <br /> Maximum No. of File: <strong>5</strong>
        </p>
        {errors.attachment && <p className="error">{errors.attachment}</p>}
        {files.map((file) => (
          <p key={file.name} className={"uploadedFileName"}>
            <AttachmentClipIcon />
            <span>
              {file.name} - {(file.size / 1024).toFixed(2)} KB
            </span>
            <button
              type="button"
              className="remove-file-btn"
              onClick={() => handleRemoveFile(file.name)}
            >
              <RemoveFileIcon />
            </button>
          </p>
        ))}
      </form>
      <div className="form-actions">
        <Button onClick={handleCreate} variant="primary">
          Create
        </Button>
        <Button onClick={handleCreate} variant="primary">
          Create and Add Another
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateTicketForm;
