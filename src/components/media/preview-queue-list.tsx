"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileVideo, FileImage, Download, X } from "lucide-react";
import { ProcessedFile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewQueueListProps {
  files: ProcessedFile[];
  onRemoveFile: (id: string) => void;
}

export function PreviewQueueList({
  files,
  onRemoveFile,
}: PreviewQueueListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Queue ({files.length})
      </h4>
      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <AnimatePresence initial={false} mode="popLayout">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-3 rounded-md bg-muted/40 border text-sm overflow-hidden"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {file.file.type.startsWith("video") ? (
                  <FileVideo className="w-4 h-4 shrink-0 text-blue-500" />
                ) : (
                  <FileImage className="w-4 h-4 shrink-0 text-purple-500" />
                )}
                <span
                  className="truncate max-w-[200px] md:max-w-[300px] font-medium"
                  title={file.file.name}
                >
                  {file.file.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    file.status === "completed" ? "default" : "secondary"
                  }
                  className="text-[10px] h-5 capitalize"
                >
                  {file.status}
                </Badge>
                {file.status === "completed" && file.result && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:text-primary transition-colors"
                    asChild
                  >
                    <a href={file.result} download={file.file.name}>
                      <Download className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => onRemoveFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
