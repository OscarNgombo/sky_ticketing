import React, { useState, type ChangeEvent, type FocusEvent } from "react";
import { Editor, useEditor, EditorContent } from "@tiptap/react";
import { useNavigate } from "react-router-dom";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { VideoExtension } from "../tiptap/extensions/VideoExtension.tsx";
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
  onCancel?: () => void;
}

const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addVideo = () => {
    const url = window.prompt("Enter YouTube or Vimeo URL");
    if (url) {
      let embedUrl = url;
      // Super simple URL parser
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      // Use the command from our custom extension
      editor.chain().focus().setVideo({ src: embedUrl }).run();
    }
  };

  return (
    <div className="textAreaIcons">
      <div className="icon-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <BoldIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <ItalicIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          <UnderlineIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          <StrikethroughIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          <Strikethrough2Icon />
        </button>
      </div>
      <div className="icon-group">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          <FontSizeIcon />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          <FontSize2Icon />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          <FontSize3Icon />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          <FontSize4Icon />
        </button>
      </div>
      <div className="icon-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <ListUnorderedIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <ListOrderedIcon />
        </button>
      </div>
      <div className="icon-group">
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
        >
          <LinkIcon />
        </button>
        <button type="button" onClick={addImage}>
          <ImageIcon />
        </button>
        <button type="button" onClick={addVideo}>
          <VideoIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          <QuoteIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          <CodeIcon />
        </button>
      </div>
      <div className="icon-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <AlignLeftIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <AlignCenterIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <AlignRightIcon />
        </button>
      </div>
      <div className="icon-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <ClearFormattingIcon />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().run()}
        >
          <ClearFormatting2Icon />
        </button>
      </div>
    </div>
  );
};

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onCancel }) => {
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    mainCategory: "",
    subCategory: "",
    problem: "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      VideoExtension,
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, description: html }));
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: undefined }));
      }
    },
  });

  const validate = (
    name: keyof FormErrors,
    value: string | File[]
  ): string | undefined => {
    switch (name) {
      case "mainCategory":
        return (value as string).trim()
          ? undefined
          : "Main category is required.";
      case "subCategory":
        return (value as string).trim()
          ? undefined
          : "Sub category is required.";
      case "problem":
        return (value as string).trim()
          ? undefined
          : "Problem/Issue is required.";
      case "description": {
        const isDescriptionEmpty =
          !editor || editor.state.doc.textContent.trim().length === 0;
        return isDescriptionEmpty ? "Description is required." : undefined;
      }
      case "attachment": {
        const currentFiles = value as File[];
        const MAX_FILES = 5;
        const MAX_SIZE_MB = 2;
        const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".pdf", ".png"];

        if (currentFiles.length > MAX_FILES) {
          return `You can upload a maximum of ${MAX_FILES} files.`;
        }

        for (const file of currentFiles) {
          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `File "${file.name}" exceeds the maximum size of ${MAX_SIZE_MB}MB.`;
          }
          const fileExtension = file.name
            .slice(file.name.lastIndexOf("."))
            .toLowerCase();
          if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            return `File type for "${
              file.name
            }" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`;
          }
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEditorBlur = () => {
    const error = validate("description", formData.description);
    setErrors((prev) => ({ ...prev, description: error }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...files, ...newFiles];
      const error = validate("attachment", allFiles);

      if (error) {
        setErrors((prev) => ({ ...prev, attachment: error }));
      } else {
        setFiles(allFiles);
        if (errors.attachment) {
          setErrors((prev) => ({ ...prev, attachment: undefined }));
        }
      }
      e.target.value = "";
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setFiles(updatedFiles);
    const error = validate("attachment", updatedFiles);
    setErrors((prev) => ({ ...prev, attachment: error }));
  };

  const handleSubmit = (): boolean => {
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validate(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    const attachmentError = validate("attachment", files);
    if (attachmentError) newErrors.attachment = attachmentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      mainCategory: "",
      subCategory: "",
      problem: "",
      description: "",
    });
    setFiles([]);
    setErrors({});
    editor?.commands.clearContent();
  };

  const saveTicketToLocalStorage = () => {
    const newTicket = {
      id: Date.now(), // Simple unique ID
      ...formData,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      createdAt: new Date().toISOString(),
    };

    const existingTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    localStorage.setItem(
      "tickets",
      JSON.stringify([...existingTickets, newTicket])
    );
    return newTicket;
  };

  const handleCreate = () => {
    if (handleSubmit()) {
      const newTicket = saveTicketToLocalStorage();
      console.log("Form is valid, ticket created and saved.", newTicket);
      navigate("/tickets");
    } else {
      console.log("Form is invalid.");
    }
  };

  const handleCreateAndAddAnother = () => {
    if (handleSubmit()) {
      const newTicket = saveTicketToLocalStorage();
      console.log("Form is valid, ticket created. Resetting form.", newTicket);
      resetForm();
    } else {
      console.log("Form is invalid.");
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
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
          onBlur={handleBlur}
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
          onBlur={handleBlur}
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
          onBlur={handleBlur}
        />
        {errors.problem && <p className="error">{errors.problem}</p>}
        <label>Description</label>
        <MenuBar editor={editor} />
        <div onBlur={handleEditorBlur} className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
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
        <Button onClick={handleCreateAndAddAnother} variant="primary">
          Create and Add Another
        </Button>
        <Button onClick={handleCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateTicketForm;
