"use strict";
tinymce.init({
    selector: "#create-copy-textarea",
});
const number = 0;
let allCopies;
const createCopyBtn = document.getElementById("create-copy");
const createCopyForm = document.getElementById("create-copy-form");
const deleteAllCopiesBtn = document.getElementById("clear-local");
const paramsForm = document.getElementById("params-form");
const closeParamsFormBtn = document.getElementById("close-params-form-btn");
const allCopiesContainer = document.getElementById("all-copies");
const numberOfSeeds = 5;
createCopyBtn.addEventListener("click", () => toggleCreateForm());
createCopyForm.addEventListener("submit", (e) => submitNewCopyForm(e));
deleteAllCopiesBtn.addEventListener("click", () => clearLocalCopies());
closeParamsFormBtn.addEventListener("click", () => {
    document.querySelectorAll(".param-field").forEach((e) => e.remove());
    paramsForm.style.display = "none";
});
document.addEventListener("DOMContentLoaded", () => {
    let localCopies = localStorage.getItem("EXT_COPIES");
    if (localCopies === null) {
        localStorage.setItem("EXT_COPIES", "[]");
        localCopies = "[]";
    }
    allCopies = JSON.parse(localCopies);
    if (allCopies.length === 0)
        return;
    allCopies.forEach((copy) => createCopy(copy, false));
});
function toggleCreateForm() {
    document.getElementById("create-copy-form").classList.toggle("active");
    createCopyBtn.classList.toggle("cancel-action");
    if (createCopyBtn.classList.contains("cancel-action")) {
        createCopyBtn.innerText = "Cancel";
        createCopyBtn.classList.add("destructive-action-btn");
    }
    else {
        createCopyBtn.innerText = "Add Copy";
        createCopyBtn.classList.remove("destructive-action-btn");
    }
}
function submitNewCopyForm(e) {
    e.preventDefault();
    const title = document.getElementById("create-copy-name").value;
    const value = tinymce.get("create-copy-textarea").getContent();
    const newID = `COPY_${new Date().getTime()}`;
    createCopy({ id: newID, title, value, params: [] });
    toggleCreateForm();
}
function createCopy(newCopy, addToLocalStorage = true) {
    let { id, title, value } = newCopy;
    const newDiv = document.createElement("div");
    const copyTitle = document.createElement("h1");
    const copyContents = document.createElement("div");
    const params = value.match(/(?<=\[\[).*?(?=\]\])/g) || [];
    const deleteCopyBtn = document.createElement("button");
    copyTitle.innerText = title;
    copyContents.innerHTML = value;
    deleteCopyBtn.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/></svg>`;
    deleteCopyBtn.addEventListener("click", (e) => {
        deleteCopy(id, e);
    });
    newDiv.id = id;
    copyTitle.classList.add("copy-title");
    copyContents.classList.add("copy-value");
    newDiv.classList.add("copy");
    deleteCopyBtn.classList.add("delete-copy-btn");
    newDiv.appendChild(copyTitle);
    newDiv.appendChild(copyContents);
    newDiv.appendChild(deleteCopyBtn);
    newDiv.addEventListener("click", () => {
        copyValue(id);
    });
    allCopiesContainer.append(newDiv);
    if (addToLocalStorage) {
        allCopies.push({ id, title, value, params });
        localStorage.setItem("EXT_COPIES", JSON.stringify(allCopies));
        document.getElementById("create-copy-name").value = "";
        tinymce.get("create-copy-textarea").setContent("");
    }
}
function copyValue(id) {
    const targetedCopy = allCopies.filter((copy) => copy.id === id)[0];
    if (targetedCopy.params.length > 0)
        enableEditParams(targetedCopy);
    else {
        const copy = document.querySelector(`#${id}`);
        if (copy === null)
            return;
        const copyContents = document.querySelector(`#${id} div.copy-value`).textContent || "";
        navigator.clipboard.writeText(copyContents);
        copy.classList.add("copied");
        setTimeout(() => {
            copy.classList.remove("copied");
        }, 500);
    }
}
function enableEditParams(copy) {
    const copyDiv = document.querySelector(`#${copy.id}`);
    const copyContents = document.querySelector(`#${copy.id} div.copy-value`).textContent || "";
    const distanceFromTop = document.querySelector("body").scrollTop;
    document.querySelector("body").scrollTop = 0;
    paramsForm.style.display = "block";
    copy.params.forEach((param) => {
        const newDiv = document.createElement("div");
        const newLabel = document.createElement("label");
        const newInput = document.createElement("input");
        newDiv.classList.add("param-field");
        newLabel.innerText = param;
        newInput.name = param;
        newInput.placeholder = "Param Value";
        newInput.required = true;
        newDiv.appendChild(newLabel);
        newDiv.appendChild(newInput);
        document.getElementById("params-form-inputs").append(newDiv);
    });
    function submitParams(event) {
        event.preventDefault();
        const allInputs = document.querySelectorAll(".param-field input");
        let alteredcopy = copyContents;
        allInputs.forEach((input) => {
            const regex = new RegExp(`\\[\\[(${input.name})\\]\\]`, "gi");
            alteredcopy = alteredcopy.replace(regex, input.value);
        });
        navigator.clipboard.writeText(alteredcopy);
        document.querySelectorAll(".param-field").forEach((e) => e.remove());
        paramsForm.style.display = "none";
        document.querySelector("body").scrollTop = distanceFromTop;
        copyDiv.classList.add("copied");
        setTimeout(() => {
            copyDiv.classList.remove("copied");
        }, 500);
        paramsForm.removeEventListener("submit", submitParams, true);
    }
    paramsForm.addEventListener("submit", submitParams, true);
}
function clearLocalCopies() {
    localStorage.setItem("EXT_COPIES", "[]");
    const allCopies = document.getElementById("all-copies");
    while (allCopies.firstChild) {
        allCopies.removeChild(allCopies.lastChild);
    }
}
function deleteCopy(id, e) {
    e.stopPropagation();
    console.log(id);
    allCopies = allCopies.filter((copy) => copy.id !== id);
    localStorage.setItem("EXT_COPIES", JSON.stringify(allCopies));
    document.getElementById(id).remove();
}
